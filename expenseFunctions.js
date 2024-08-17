import { client } from "./index.js";

export async function getAllExpensesById(userId) {
    return await client.db("expense-tracker").collection("expenses").find({ userId: userId }).toArray();;
}

export async function addItem(req) {
    return await client.db("expense-tracker").collection("expenses").insertOne(req);
}