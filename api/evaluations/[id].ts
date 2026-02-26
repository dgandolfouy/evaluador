import { VercelRequest, VercelResponse } from '@vercel/node';
import { db, VercelPoolClient } from '@vercel/postgres';
import { handleDeleteEvaluation } from '../deleteEvaluation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid evaluation ID' });
    }

    let client: VercelPoolClient | undefined;
    try {
      client = await db.connect();
      await handleDeleteEvaluation(client, id);
      return res.status(200).json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      client?.release();
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
