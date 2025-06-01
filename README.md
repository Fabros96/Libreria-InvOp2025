# README

Este es el archivo README para el proyecto. Aquí encontrarás las instrucciones necesarias para ejecutar el proyecto correctamente.

## Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Node.js
- MySQL

## Configuración

1. Clona este repositorio en tu máquina local.
2. Abre una terminal y navega hasta la carpeta del proyecto.
3. Ejecuta el siguiente comando para instalar las dependencias:

   ```
   npm install prisma --save-dev
   npm install @prisma/client
   npx prisma init
   npm install
   ```

4. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias. Puedes encontrar un ejemplo en el archivo `.env.example`. Asegúrate de incluir las variables de entorno `PORT`, `FRONTEND_URL` y `DATABASE_URL`, y establecer los valores deseados. Aquí tienes un ejemplo de configuración del archivo `.env`:

   ```
   PORT=3000
   DATABASE_URL=mysql://username:password@localhost:3306/database_name
   FRONT_URL=localhost:5157
   ```


## Migraciones y seeds

1. Genera migracion y/o las corre
   npx prisma migrate dev

2. Ejecuta los seeds
   npx prisma db seed

3. Permite resetear todas las tablas y ejecuta los seeds
   npx prisma migrate reset


## Ejecución

Una vez que hayas completado la configuración, puedes ejecutar el proyecto utilizando el siguiente comando:

```
npx nodemon
```

o npm run dev (http://localhost:3000/)

Esto iniciará el servidor y podrás acceder a la aplicación en `http://localhost:<PORT>`.