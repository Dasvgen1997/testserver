import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  database: 'mdb',
  port: 5432, //
});

// Подключение к базе данных
async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Подключение к БД успешно!');
  } catch (error) {
    console.error('Ошибка подключения к БД:', error);
  }
}

export { sequelize, connectToDatabase };
