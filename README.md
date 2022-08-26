<div align="center">
  <img src="./images/logo.png" width="200" />
</div>
<div align="center">
  ⚡️ Torneos de coches basados en votos ⚡️
</div>
<br />
<div align="center">

![Backend](https://github.com/josexs/carsTournaments-backend/actions/workflows/deploy.yml/badge.svg)
![App](https://github.com/josexs/carsTournaments-app/actions/workflows/build.yml/badge.svg)

![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) ![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white) ![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white) ![Como empezar](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)

Hecho en España <img src="https://cdn.freebiesupply.com/logos/large/2x/spainc-logo-svg-vector.svg" width="20" />

<a href="https://twitter.com/CarsTournaments"><img src="https://img.shields.io/twitter/follow/CarsTournaments" /></a>

</div>

---

## Instalación

Primeramente necesitas tener un archivo .env

```
NODE_ENV=""
NAME=""
PORT=""
MONGO_URI=""
PATH_PROJECT=""
PATH_UPLOADS=""
PATH_ADMIN=""
PATH_APP=""
JWT_SECRET=""
SSH_KEY=""
SSH_HOST=""
```

_Asegurate que las rutas sean correctas_

Una vez creado el archivo ejecuta

```
npm run install
```

## Scripts

| Comando                    | Informacion                   |
| -------------------------- | ----------------------------- |
| tsc                        | JS to Ts. **Pro**             |
| tscw                       | JS to Ts witch watch. **Dev** |
| start                      | Init server. **Dev**          |
| update                     | Update server **Pro**         |
| lint                       | run eslint                    |
| prettier:list              |                               |
| prettier:write             |                               |
| install:force              |                               |
| install:android:release    |                               |
| install:android:debug      |                               |
| build:admin                |                               |
| build:app                  |                               |
| distribute:android         |                               |
| distribute:android:release |                               |
| distribute:android:force   |                               |
| distribute:ios             |                               |
| images:localhost:server    |                               |
| images:server:local        |                               |
| sign:android               |                               |
| sign:android:install       |                               |
| ota                        |                               |

## Api Reference

Dentro de la carpeta thunder puedes encontrar el [archivo](https://github.com/josexs/carsTournaments-backend/blob/master/thunder/thunderclient.json) json que contiene todas las rutas.

Para configurarlo en visual studio, en settings añadirlo siguiente

```
"thunder-client.customLocation": "carsTournaments-backend/thunder",
```

## Base de datos

Se esta usando mongoDB Atlas en la version gratuita. Hay una version para PRO y otra para UAT, segun configures el .env
