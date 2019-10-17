/**
 * O processo de Queues deve ser iniciado em processo separado:
 * yarn queue
 */
import 'dotenv/config';
import Queue from './lib/Queue';

Queue.processQueue();
