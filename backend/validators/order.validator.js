const Joi = require('joi');

const placeOrderSchema = Joi.object({
  farmerId: Joi.string().hex().length(24).required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().hex().length(24).required(),
      quantity: Joi.object({
        value: Joi.number().positive().required(),
        unit: Joi.string().valid('kg', 'quintal', 'ton', 'litre', 'dozen', 'piece').required(),
      }).required(),
    })
  ).min(1).required(),
  deliveryAddress: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
  }).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'shipped', 'delivered', 'cancelled')
    .required(),
  note: Joi.string().max(500).optional(),
});

module.exports = { placeOrderSchema, updateStatusSchema };
