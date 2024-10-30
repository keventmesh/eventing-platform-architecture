import {ActionFunctionArgs, json} from "@remix-run/node";

import {CloudEvent, emitterFor, httpTransport} from "cloudevents";
import {requiredEnv} from "~/lib/env";

export const action = async ({request}: ActionFunctionArgs) => {

    const emit = emitterFor(httpTransport(requiredEnv("K_SINK")));
    const orderDataSchema = requiredEnv("EVENT_SCHEMA_ORDER");

    const form = await request.formData()
    console.log("Action order", form)

    const formData = form.get("data")
    if (formData == null) {
        console.log("data is null, skipping")
        return json(
            {error: "Data is null"},
            {status: 400}
        )
    }
    const data = JSON.parse(formData.toString())

    if (data['orderItems'] == null || data['orderItems'] == undefined || data['orderItems'].length <= 0) {
        return json(
            {error: "No icons selected"},
            {status: 400}
        )
    }

    const ce = new CloudEvent({
        type: "com.shop.products.order",
        source: "com.shop.website",
        dataschema: orderDataSchema,
        data: {
            'orderId': '889a0c90-64a1-4f21-a41b-ef30d9b819e7',
            'orderItems': data['orderItems'],
            'orderDate': new Date().toISOString(),
            'payment': {
                'method': 'credit_card',
                'transactionId': '889a0c90-64a1-4f21-a41b-ef30d9b819e7'
            },
            'totalAmount': data['orderItems'].reduce((total, b: { price: number }) => total + b.price, 0.0),
            "customer": {
                "customerId": "CUST001",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "address": {
                    "street": "456 Elm St",
                    "city": "Salt Lake City",
                    "state": "UT",
                    "postalCode": "84101",
                    "country": "USA"
                }
            },
        }
    });

    console.log(ce)

    try {
        await emit(ce)
    } catch (e) {
        return json(
            {error: "Emit failed " + e},
            {status: 400}
        )
    }

    return new Response("", {status: 200})
}
