import { Router } from 'express';
import { Restaurant, Vote, Tag } from '../models';
import { loggedIn, errorCatcher } from './ApiHelper';
import { restaurantPosted, restaurantDeleted, restaurantRenamed } from '../actions/restaurants';
import voteApi from './votes';
import restaurantTagApi from './restaurantTags';
import request from 'request';

const router = new Router();
const apikey = process.env.GOOGLE_SERVER_APIKEY;

router
  .get('/', async (req, res) => {
    Restaurant.findAllWithTagIds().then(all => {
      res.status(200).send({ error: false, data: all });
    }).catch(err => errorCatcher(res, err));
  })
  .get('/:id/place_url', async (req, res, next) => {
    Restaurant.findById(parseInt(req.params.id, 10)).then(r => {
      request(`https://maps.googleapis.com/maps/api/place/details/json?key=${apikey}&placeid=${r.place_id}`,
        (error, response, body) => {
          if (!error && response.statusCode === 200) {
            const json = JSON.parse(body);
            if (json.status !== 'OK') {
              next(json);
            } else {
              if (json.result && json.result.url) {
                res.redirect(json.result.url);
              } else {
                res.redirect(`https://www.google.com/maps/place/${r.name}, ${r.address}`);
              }
            }
          } else {
            next(error);
          }
        }
      );
    }).catch(err => {
      next(err);
    });
  })
  .post(
    '/',
    loggedIn,
    async (req, res) => {
      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      const { name, place_id, lat, lng } = req.body;

      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      let { address } = req.body;
      address = address.replace(`${name}, `, '');

      // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
      Restaurant.create({
        name,
        place_id,
        address,
        lat,
        lng,
        votes: [],
        tags: []

      // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
      }, { include: [Vote, Tag] }).then(obj => {
        const json = obj.toJSON();
        req.wss.broadcast(restaurantPosted(json, req.user.id));
        res.status(201).send({ error: false, data: json });
      }).catch(() => {
        const error = { message: 'Could not save new restaurant. Has it already been added?' };
        errorCatcher(res, error);
      });
    }
  )
  .patch(
    '/:id',
    loggedIn,
    async (req, res) => {
      const id = parseInt(req.params.id, 10);
      const { name } = req.body;
      Restaurant.update({ name }, { fields: ['name'], where: { id }, returning: true }).spread((count, rows) => {
        const json = { name: rows[0].toJSON().name };
        req.wss.broadcast(restaurantRenamed(id, json, req.user.id));
        res.status(200).send({ error: false, data: json });
      }).catch(() => {
        const error = { message: 'Could not update restaurant.' };
        errorCatcher(res, error);
      });
    }
  )
  .delete(
    '/:id',
    loggedIn,
    async (req, res) => {
      const id = parseInt(req.params.id, 10);
      Restaurant.destroy({ where: { id } }).then(() => {
        req.wss.broadcast(restaurantDeleted(id, req.user.id));
        res.status(204).send({ error: false });
      }).catch(err => errorCatcher(res, err));
    }
  )
  .use('/:restaurant_id/votes', voteApi)
  .use('/:restaurant_id/tags', restaurantTagApi);

export default router;
