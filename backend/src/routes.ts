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
  sendEvent();
  res.json(result);
});

router.patch('/', async (req, res) => {
  const result = await postDataService.updateAppointments(req.body);
  sendEvent();
  res.json(result);
});

router.delete('/', async (req, res) => {
  const result = await clearDBService.clearDB();
  sendEvent();
  res.json(result);
});

router.get('/', async (req, res) => {
  const { leftTable, rightTable } = await leftTableService.getTablesData();
  res.json([leftTable, rightTable]);
});

function sendEvent() {
  const data = { message: 'Table updated' };
  clients.forEach((res) => res.write(`data: ${JSON.stringify(data)}\n\n`));
}
const clients: any[] = [];
router.get('/events', (req, res) => {
  console.log('Client connected');
  // Set headers for EventSource response
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  clients.push(res);
  sendEvent();
});
export default router;
