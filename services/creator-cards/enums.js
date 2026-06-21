/**
 * @typedef {"draft"|"published"} CardStatusString
 */

/**
 * @typedef {Object} CardStatues
 * @property {CardStatusString} DRAFT
 * @property {CardStatusString} PUBLISHED
 */

/**
 * @readonly
 * @enum {CardStatusString}
 */
const CardStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
};

/**
 * @typedef {"public"|"private"} AccessTypeString
 */

/**
 * @typedef {Object} AccessTypes
 * @property {AccessTypeString} PUBLIC
 * @property {AccessTypeString} PRIVATE
 */

/**
 * @readonly
 * @enum {AccessTypeString}
 */

const AccessType = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

/**
 * @typedef {"NGN"|"USD"|"GBP"|"GHS"} CurrencyString
 */

/**
 * @typedef {Object} Currencies
 * @property {CurrencyString} NGN
 * @property {CurrencyString} USD
 * @property {CurrencyString} GBP
 * @property {CurrencyString} GHS
 */

/**
 * @readonly
 * @enum {CurrencyString}
 */
const Currency = {
  NGN: 'NGN',
  USD: 'USD',
  GBP: 'GBP',
  GHS: 'GHS',
};

module.exports = {
  CardStatus,
  AccessType,
  Currency,
};
