import express, { response } from "express";
import { getAllExpensesById,addItem } from "./expenseFunctions.js";
const router =express.Router();

router.get('/:userId',async function (req, res) {
    const {userId} = req.params;
       console.log(req.params,userId);
     
      console.log(req);
    
     const expenses = await getAllExpensesById(userId)
        res.send(expenses)
      })
  


router.post('/add',async function (req, res) {
 
    const data= req.body;
  console.log(data);
  try{
  const result = await addItem(data);
    res.send(result);
  }catch(ex){
console.log("Exception is " ,ex)
  }})

  export const expenseRouter=router;
  