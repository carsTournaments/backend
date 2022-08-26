import { MessageI } from '@interfaces';
import { Menu, MenuI } from '@menu';
export class MenuService {
  getAll() {
    return Menu.find({}).exec();
  }

  getMenu(): Promise<MenuI[]> {
    try {
      // sort By position
      return Menu.find({}).sort({ position: 1 }).exec();
    } catch (error) {
      return error;
    }
    // return new Promise((resolve) => {
    //     const items: MenuI[] = [
    // {
    //     route: 'dashboard',
    //     name: 'Dashboard',
    //     type: 'link',
    //     icon: 'dashboard',
    // },
    // {
    //     route: 'tournaments',
    //     name: 'Torneos',
    //     type: 'sub',
    //     icon: 'local_convenience_store',
    //     children: [
    //         {
    //             route: 'list',
    //             name: 'Listado',
    //             type: 'link',
    //         },
    //         {
    //             route: 'inscriptions',
    //             name: 'Inscripciones',
    //             type: 'link',
    //         },
    //         {
    //             route: 'rounds',
    //             name: 'Rondas',
    //             type: 'link',
    //         },
    //         {
    //             route: 'pairings',
    //             name: 'Emparejamientos',
    //             type: 'link',
    //         },
    //         {
    //             route: 'votes',
    //             name: 'Votos',
    //             type: 'link',
    //         },
    //         {
    //             route: 'winners',
    //             name: 'Ganadores',
    //             type: 'link',
    //         },
    //     ],
    // },
    // {
    //     route: 'cars',
    //     name: 'Coches',
    //     type: 'sub',
    //     icon: 'directions_car',
    //     children: [
    //         {
    //             route: 'list',
    //             name: 'Listado',
    //             type: 'link',
    //         },
    //         {
    //             route: 'brands',
    //             name: 'Marcas',
    //             type: 'link',
    //         },
    //         {
    //             route: 'likes',
    //             name: 'Likes',
    //             type: 'link',
    //         },
    //     ],
    // },
    // {
    //     route: 'images',
    //     name: 'Imagenes',
    //     type: 'link',
    //     icon: 'image',
    // },
    // {
    //     route: 'reports',
    //     name: 'Reportes',
    //     type: 'link',
    //     icon: 'report_problem',
    // },
    // {
    //     route: 'users',
    //     name: 'Usuarios',
    //     type: 'link',
    //     icon: 'people',
    // },
    // {
    //     route: 'system',
    //     name: 'Sistema',
    //     type: 'sub',
    //     icon: 'settings',
    //     children: [
    //         {
    //             route: 'settings',
    //             name: 'Configuracion',
    //             type: 'link',
    //         },
    //         {
    //             route: 'toggles',
    //             name: 'Toggles',
    //             type: 'link',
    //         },
    //         {
    //             route: 'ota',
    //             name: 'Otas',
    //             type: 'link',
    //         },
    //         {
    //             route: 'stats',
    //             name: 'Estadisticas',
    //             type: 'link',
    //         },
    //         {
    //             route: 'logs',
    //             name: 'Logs',
    //             type: 'link',
    //         },
    //         {
    //             route: 'notifications',
    //             name: 'Notificationes Push',
    //             type: 'link',
    //         },
    //     ],
    // },
    // {
    //     route: 'enlaces',
    //     name: 'Enlaces',
    //     type: 'sub',
    //     icon: 'link',
    //     children: [
    //         {
    //             route: 'Google',
    //             name: 'Google',
    //             type: 'sub',
    //             children: [
    //                 {
    //                     route: 'https://play.google.com/console/u/0/developers/4857692934101353500/app/4972030920851259451/app-dashboard?timespan=thirtyDays',
    //                     name: 'Analytics',
    //                     type: 'extTabLink',
    //                 },
    //                 {
    //                     route: 'https://console.firebase.google.com/project/carstournaments-ec272/overview',
    //                     name: 'Firebase',
    //                     type: 'extTabLink',
    //                 },
    //                 {
    //                     route: 'https://play.google.com/console/u/0/developers/4857692934101353500/app/4972030920851259451/app-dashboard?timespan=thirtyDays',
    //                     name: 'Play Console',
    //                     type: 'extTabLink',
    //                 },
    //             ]
    //         },
    //         {
    //             route: 'https://josexs.grafana.net/d/WsrVVC9nk/node-js-overview?orgId=1&refresh=30s&from=now-5m&to=now',
    //             name: 'Grafana',
    //             type: 'extTabLink',
    //         }
    //     ]
    // }
    // ];
    // resolve(items);
    // });
  }

  async getOne(id: string): Promise<MenuI> {
    return Menu.findById(id).exec();
  }

  async create(item: MenuI): Promise<MenuI> {
    return Menu.create(item);
  }

  async update(item: MenuI): Promise<MenuI> {
    return Menu.findByIdAndUpdate(item._id, item, {
      new: true,
    }).exec();
  }

  async deleteOne(id: string): Promise<MessageI> {
    await Menu.findByIdAndDelete(id).exec();
    return { message: 'Item del menu eliminado' };
  }
}
