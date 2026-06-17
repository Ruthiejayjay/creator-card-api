const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/models/creator-card');
const { serializeCard } = require('./create');

const deleteCardSpec = `root {
  slug string<trim>
  creator_reference string<trim|length:20>
}`;

const parsedDeleteCardSpec = validator.parse(deleteCardSpec);

async function deleteCreatorCard(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedDeleteCardSpec);

  try {
    const card = await CreatorCard.findOne({ slug: data.slug, deleted: null });

    if (!card) {
      throwAppError(CreatorCardMessages.CARD_NOT_FOUND, 'NF01');
    }

    card.deleted = Date.now();
    card.updated = Date.now();
    await card.save();

    response = serializeCard(card);
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
