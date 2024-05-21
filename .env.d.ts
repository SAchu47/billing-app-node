// env.d.ts
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        ACCESS_SECRET_KEY: string;
        ACCESS_SECRET_TIME: string;
    }
}
