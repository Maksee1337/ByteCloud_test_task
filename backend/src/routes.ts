import express from 'express';
import { PostDataService } from './services/postData.service';
import { ClearDBService } from './services/clearDB.service';
import { TablesService } from './services/tables.service';

const router = express.Router();
const postDataService = new PostDataService();
const clearDBService = new ClearDBService();
const leftTableService = new TablesService();

router.post('/', async (req, res) => {
  const result = await postDataService.addData(req.body);
  res.json(result);
});

router.delete('/', async (req, res) => {
  const result = await clearDBService.clearDB();
  res.json(result);
});

router.get('/', async (req, res) => {
  const { leftTable, rightTable } = await leftTableService.getTablesData();
  res.json({ leftTable, rightTable });
});
export default router;
