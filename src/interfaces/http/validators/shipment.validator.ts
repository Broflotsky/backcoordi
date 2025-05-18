import { body } from "express-validator";

export const shipmentValidator = [
  body("user_id").isInt().withMessage("user_id es requerido"),
  body("origin_id").isInt().withMessage("origin_id es requerido"),
  body("destination_id").isInt().withMessage("destination_id es requerido"),
  body("destination_detail")
    .optional()
    .isString()
    .withMessage("destination_detail debe ser texto"),
  body("product_type_id").isInt().withMessage("product_type_id es requerido"),
  body("weight_grams").isInt({min: 1}).withMessage("weight_grams debe ser un número mayor a 0"),
  body("dimensions").isString().withMessage("dimensions es requerido"),
  body("recipient_name").isString().withMessage("recipient_name es requerido"),
  body("recipient_address")
    .isString()
    .withMessage("recipient_address es requerido"),
  body("recipient_phone")
    .isString()
    .withMessage("recipient_phone es requerido"),
  body("recipient_document")
    .isString()
    .withMessage("recipient_document es requerido"),
];
