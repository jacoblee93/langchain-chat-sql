import { neon, Pool } from '@neondatabase/serverless';

const sql = neon(process.env.LLM_POSTGRES_CONNECTION_STRING!);

interface SqlColumn {
  columnName: string;
  dataType?: string;
  isNullable?: boolean;
}

interface SqlTable {
  tableName: string;
  columns: SqlColumn[];
}

interface RawResultTableAndColumn {
  table_name: string;
  column_name: string;
  data_type: string | undefined;
  is_nullable: string;
}

const formatToSqlTable = (rawResultsTableAndColumn: RawResultTableAndColumn[]) => {
  const sqlTable: Array<SqlTable> = [];
  for (const oneResult of rawResultsTableAndColumn) {
    const sqlColumn = {
      columnName: oneResult.column_name,
      dataType: oneResult.data_type,
      isNullable: oneResult.is_nullable === "YES",
    };
    const currentTable = sqlTable.find(
      (oneTable) => oneTable.tableName === oneResult.table_name
    );
    if (currentTable) {
      currentTable.columns.push(sqlColumn);
    } else {
      const newTable = {
        tableName: oneResult.table_name,
        columns: [sqlColumn],
      };
      sqlTable.push(newTable);
    }
  }

  return sqlTable;
}

const getTableAndColumnsName = async (): Promise<SqlTable[]> => {
  const rep = await sql`SELECT 
      t.table_name, 
      c.* 
    FROM 
      information_schema.tables t 
        JOIN information_schema.columns c 
          ON t.table_name = c.table_name 
    WHERE 
      t.table_schema = 'public' 
        AND c.table_schema = 'public' 
    ORDER BY 
      t.table_name,
      c.ordinal_position;`;

  return formatToSqlTable(rep as RawResultTableAndColumn[]);
}

const formatSqlResponseToSimpleTableString = (rawResult: unknown): string => {
  if (!rawResult || !Array.isArray(rawResult) || rawResult.length === 0) {
    return "";
  }

  let globalString = "";
  for (const oneRow of rawResult) {
    globalString += `${Object.values(oneRow).reduce(
      (completeString, columnValue) => `${completeString} ${columnValue}`,
      ""
    )}\n`;
  }

  return globalString;
};

const generateTableInfoFromTables = async (
  tables: Array<SqlTable> | undefined,
  nbSampleRow: number,
  customDescription?: Record<string, string>
): Promise<string> => {
  if (!tables) {
    return "";
  }

  let globalString = "";
  const pool = new Pool({ connectionString: process.env.LLM_POSTGRES_CONNECTION_STRING });
  for (const currentTable of tables) {
    // Add the custom info of the table
    const tableCustomDescription =
      customDescription &&
      Object.keys(customDescription).includes(currentTable.tableName)
        ? `${customDescription[currentTable.tableName]}\n`
        : "";
    // Add the creation of the table in SQL
    const schema = "public";
    let sqlCreateTableQuery = schema
      ? `CREATE TABLE "${schema}"."${currentTable.tableName}" (\n`
      : `CREATE TABLE ${currentTable.tableName} (\n`;
    for (const [key, currentColumn] of currentTable.columns.entries()) {
      if (key > 0) {
        sqlCreateTableQuery += ", ";
      }
      sqlCreateTableQuery += `${currentColumn.columnName} ${
        currentColumn.dataType
      } ${currentColumn.isNullable ? "" : "NOT NULL"}`;
    }
    sqlCreateTableQuery += ") \n";

    const sqlSelectInfoQuery = `SELECT * FROM "${currentTable.tableName}" LIMIT ${nbSampleRow};\n`;

    const columnNamesConcatString = `${currentTable.columns.reduce(
      (completeString, column) => `${completeString} ${column.columnName}`,
      ""
    )}\n`;

    let sample = "";
    try {
      const infoObjectResult = nbSampleRow
        // Need to use pool because table names are custom
        ? await pool.query(`SELECT * FROM "${currentTable.tableName}" LIMIT ${nbSampleRow};`)
        : null;
      sample = formatSqlResponseToSimpleTableString(infoObjectResult?.rows);
    } catch (error) {
      // If the request fails we catch it and only display a log message
      console.log(error);
    }

    globalString = globalString.concat(
      tableCustomDescription +
        sqlCreateTableQuery +
        sqlSelectInfoQuery +
        columnNamesConcatString +
        sample
    );
  }
  
  await pool.end();

  return globalString;
};

let cachedAllTables: SqlTable[] | undefined = undefined;

export const db = {
  getTableInfo: async (targetTables?: Array<string>) => {
    const allTables = cachedAllTables ?? await getTableAndColumnsName();
    cachedAllTables = allTables;
    let selectedTables = targetTables && targetTables.length > 0
      ? allTables.filter((currentTable) =>
          targetTables.includes(currentTable.tableName)
        )
      : allTables;

    return generateTableInfoFromTables(
      selectedTables,
      3,
    );
  },
  run: async (query: string) => {
    const pool = new Pool({ connectionString: process.env.LLM_POSTGRES_CONNECTION_STRING });
    const result = await pool.query(query);
    await pool.end(); 
    return JSON.stringify(result);
  }
}