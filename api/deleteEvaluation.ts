import { VercelPoolClient, sql } from '@vercel/postgres';

export async function handleDeleteEvaluation(client: VercelPoolClient, evaluationId: string) {
  if (!evaluationId) {
    throw new Error('Evaluation ID is required');
  }

  try {
    await client.sql`BEGIN`;

    // First, delete the criteria associated with the evaluation
    await client.sql`DELETE FROM evaluation_criteria WHERE evaluation_id = ${evaluationId}`;

    // Then, delete the evaluation itself
    await client.sql`DELETE FROM evaluations WHERE id = ${evaluationId}`;

    await client.sql`COMMIT`;

  } catch (error) {
    await client.sql`ROLLBACK`;
    console.error('Error deleting evaluation:', error);
    throw new Error('Failed to delete evaluation from the database.');
  }
}
