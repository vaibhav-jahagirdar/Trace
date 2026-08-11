"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeCheckpoint = storeCheckpoint;
exports.getCheckpoint = getCheckpoint;
exports.deleteExpiredCheckpoints = deleteExpiredCheckpoints;
exports.storePermanentResult = storePermanentResult;
exports.getPermanentResult = getPermanentResult;
async function storeCheckpoint(client, taskId, rawLlmResponse, ttlDays = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    const query = `
    INSERT INTO resume_analysis_checkpoints (
      application_task_id,
      stage,
      raw_llm_response,
      expires_at
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (application_task_id)
    DO UPDATE SET
      raw_llm_response = EXCLUDED.raw_llm_response,
      expires_at = EXCLUDED.expires_at,
      stage = EXCLUDED.stage
  `;
    await client.query(query, [taskId, 'resume_analysis', rawLlmResponse, expiresAt]);
}
async function getCheckpoint(client, taskId) {
    const query = `
    SELECT raw_llm_response
    FROM resume_analysis_checkpoints
    WHERE application_task_id = $1
      AND expires_at > NOW()
  `;
    const result = await client.query(query, [taskId]);
    if (result.rowCount === 0 || !result.rows[0]) {
        return null;
    }
    const raw = result.rows[0].raw_llm_response;
    if (raw === null || raw === undefined) {
        return null;
    }
    if (typeof raw === 'string') {
        return raw;
    }
    return JSON.stringify(raw);
}
async function deleteExpiredCheckpoints(client) {
    const result = await client.query(`DELETE FROM resume_analysis_checkpoints WHERE expires_at <= NOW()`);
    return result.rowCount ?? 0;
}
async function storePermanentResult(client, taskId, requestHash, rawLlmResponse, cleanedResponse) {
    const cleanedJson = JSON.stringify(cleanedResponse);
    const query = `
    INSERT INTO resume_analysis_results (
      application_task_id,
      request_hash,
      raw_llm_response,
      cleaned_response
    ) VALUES ($1, $2, $3, $4)
    ON CONFLICT (application_task_id)
    DO UPDATE SET
      raw_llm_response = EXCLUDED.raw_llm_response,
      cleaned_response = EXCLUDED.cleaned_response,
      request_hash = EXCLUDED.request_hash,
      updated_at = NOW()
    RETURNING id
  `;
    const result = await client.query(query, [
        taskId,
        requestHash,
        rawLlmResponse,
        cleanedJson,
    ]);
    if (result.rowCount === 0 || !result.rows[0]) {
        throw new Error('Failed to store permanent result');
    }
    return result.rows[0].id;
}
async function getPermanentResult(client, taskId) {
    const query = `
    SELECT request_hash, raw_llm_response
    FROM resume_analysis_results
    WHERE application_task_id = $1
  `;
    const result = await client.query(query, [taskId]);
    if (result.rowCount === 0 || !result.rows[0]) {
        return null;
    }
    const row = result.rows[0];
    const raw = row.raw_llm_response;
    let rawString;
    if (typeof raw === 'string') {
        rawString = raw;
    }
    else {
        rawString = JSON.stringify(raw);
    }
    return {
        request_hash: row.request_hash,
        raw_llm_response: rawString,
    };
}
//# sourceMappingURL=checkpoint.js.map