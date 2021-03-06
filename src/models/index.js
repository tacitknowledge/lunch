import { sequelize } from './db';
import Vote from './Vote';
import User from './User';
import WhitelistEmail from './WhitelistEmail';
import RestaurantTag from './RestaurantTag';
import Tag from './Tag';
import Restaurant from './Restaurant';
import Decision from './Decision';

Tag.addScope('orderedByRestaurant', {
  distinct: 'id',
  attributes: [
    'id',
    'name',
    [sequelize.fn('count', sequelize.col('restaurants_tags.restaurant_id')), 'restaurant_count']
  ],
  include: [
    {
      attributes: [],
      model: RestaurantTag,
      required: false
    }
  ],
  group: ['tag.id'],
  order: 'restaurant_count DESC'
});

Restaurant.findAllWithTagIds = () =>
  Restaurant.findAll({
    attributes: {
      include: [
        [sequelize.literal('COUNT(*) OVER(PARTITION BY "restaurant"."id")'), 'vote_count'],
        [sequelize.literal(`ARRAY(SELECT "tag_id" from "restaurants_tags"
          where "restaurants_tags"."restaurant_id" = "restaurant"."id")`),
        'tags'],
        [sequelize.literal(`(SELECT COUNT(*) from "votes" as "all_votes"
          where "all_votes"."restaurant_id" = "restaurant"."id"
          and "all_votes"."created_at" >= CURRENT_DATE - INTERVAL \'4 weeks\')`),
        'all_vote_count'],
        [sequelize.literal(`(SELECT COUNT(*) from "decisions" as "all_decisions"
          where "all_decisions"."restaurant_id" = "restaurant"."id"
          and "all_decisions"."created_at" >= CURRENT_DATE - INTERVAL \'4 weeks\')`),
        'all_decision_count']
      ],
      exclude: ['updated_at']
    },
    include: [
      {
        model: Vote.scope('fromToday'),
        required: false,
        attributes: ['id', 'user_id', 'restaurant_id', 'created_at']
      },
      {
        model: Decision.scope('fromToday'),
        required: false,
        attributes: ['id']
      }
    ],
    order:
      `decisions.id NULLS LAST,
      vote_count DESC,
      votes.created_at DESC NULLS LAST,
      all_decision_count ASC,
      all_vote_count DESC,
      name ASC`
  });

Restaurant.hasMany(Vote);
Restaurant.hasMany(Decision);
Restaurant.belongsToMany(Tag, {
  through: 'restaurants_tags'
});
Restaurant.hasMany(RestaurantTag);

User.hasMany(Vote);

Tag.belongsToMany(Restaurant, {
  through: 'restaurants_tags'
});
Tag.hasMany(RestaurantTag);

RestaurantTag.belongsTo(Restaurant);
RestaurantTag.belongsTo(Tag);

export { Vote, User, WhitelistEmail, RestaurantTag, Tag, Restaurant, Decision };
