import {ActionFunctionArgs, json} from "@remix-run/node";

import {CloudEvent, emitterFor, httpTransport} from "cloudevents";
import {requiredEnv} from "~/lib/env";

export const action = async ({request}: ActionFunctionArgs) => {

    const emit = emitterFor(httpTransport(requiredEnv("K_SINK")));
    const cartChangedDataSchema = requiredEnv("EVENT_SCHEMA_CART_CHANGED");

    const form = await request.formData()
    console.log("Action select-product", form)

    const formData = form.get("data")
    if (formData == null) {
        console.log("data is null, skipping")
        return json(
            {error: "Data is null"},
            {status: 400}
        )
    }
    const data = JSON.parse(formData.toString())

    let ce: CloudEvent
    if (data.action == 'added') {
        ce = new CloudEvent({
            type: "com.shop.products.cart.added",
            source: "com.shop.website",
            dataschema: cartChangedDataSchema,
            data: data
        });
    } else if (data.action == 'removed') {
        ce = new CloudEvent({
            type: "com.shop.products.cart.removed",
            source: "com.shop.website",
            dataschema: cartChangedDataSchema,
            data: data
        });
    } else {
        return json(
            {error: "Unknown action"},
            {status: 400}
        )
    }

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
