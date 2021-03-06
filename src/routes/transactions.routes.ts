import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const transactionsService = new CreateTransactionService();

  const transaction = await transactionsService.execute(request.body);

  delete transaction.category_id;

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const transactionsService = new DeleteTransactionService();
  const { id } = request.params;

  await transactionsService.execute(id);

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const transactionsService = new ImportTransactionsService();

    const transactions = await transactionsService.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
