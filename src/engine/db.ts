import { createPool, PoolOptions, escape } from "mysql2";
import { Site } from "../site";

const access: PoolOptions = {
    host: Site.DB_HOST,
    user: Site.DB_USER,
    password: Site.DB_PASS,
    database: Site.DB_SCHEMA,
    multipleStatements: true,
    charset: 'utf8mb4',
    port: Site.DB_PORT || undefined,
};

export class DB {
    private static conn = createPool(access);

    static error: string = "server";

    static con = () => {
        return DB.conn;
    }

    static escape = (m: any) => {
        return escape(m);
    }
}