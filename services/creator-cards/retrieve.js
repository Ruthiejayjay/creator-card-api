const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const { CreatorCardMessages, CreatorCardErrorCodes } = require('@app/messages/creator-card');
const CreatorCard = require('@app/models/creator-card');
const { serializeCard } = require('./create');
const { CardStatus, AccessType } = require('./enums');

const retrieveCardSpec = `root {
  slug string<trim>
  access_code? string<trim>
}`;

const parsedRetrieveCardSpec = validator.parse(retrieveCardSpec);

async function retrieveCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedRetrieveCardSpec);

  try {
    const card = await CreatorCard.findOne({ slug: data.slug, deleted: null });

    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, CreatorCardErrorCodes.CARD_NOT_FOUND);
    }

    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, CreatorCardErrorCodes.CARD_IS_DRAFT);
    }

    if (card.access_type === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.PRIVATE_NO_CODE, CreatorCardErrorCodes.PRIVATE_NO_CODE);
    }

    if (card.access_type === 'private' && data.access_code !== card.access_code) {
      throwAppError(
        CreatorCardMessages.INVALID_ACCESS_CODE,
        CreatorCardErrorCodes.INVALID_ACCESS_CODE
      );
    }

    const serialized = serializeCard(card);

    response = serialized(card, { excludeAccessCode: true });
  } catch (error) {
    appLogger.errorX(error, 'retrieve-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = retrieveCreatorCard;
