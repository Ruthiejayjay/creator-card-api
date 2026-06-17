const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const retrieveCreatorCard = require('@app/services/creator-cards/retrieve');
const CreatorCardMessages = require('@app/messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'retrieve-creator-card-request-completed');
  },

  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      access_code: rc.query.access_code,
    };

    const response = await retrieveCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_RETRIEVED,
      data: response,
    };
  },
});
