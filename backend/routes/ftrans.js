import express from 'express';
import FuelTransaction from '../models/stock.js';
import emitter from '../events/emitter.js';
import { getIO } from '../socket.js';

const ftrans = express.Router();

ftrans.get('/', async (req, res) => {
  try {
    const transactions = await FuelTransaction.find().sort({ date: -1 }).limit(10);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ error: 'Failed to fetch fuel transactions' });
  }
});

ftrans.post('/', async (req, res) => {
  try {
    
    const transaction = new FuelTransaction(req.body);
    await transaction.save();

    const io = getIO();
    io.emit("newTransaction", transaction);
    
    emitter.emit('newTransactionCreated', transaction);
    console.log('Emitted internal newTransactionCreated event:', transaction);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error.message);
    res.status(400).json({ message: error.message });
  }
});

export default ftrans;
