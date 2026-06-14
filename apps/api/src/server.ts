import "dotenv/config"; 
import { getDb } from "./config/db";

async function bootstrap() {
  await getDb().query("SELECT NOW()");
  console.log("DB Connected");
}

bootstrap();