import { ListCallsResponse } from '../types/vapi.ts';

const VAPI_API_URL = 'https://api.vapi.ai';
const VAPI_TOKEN = '5a069dd4-af8f-442d-b7b1-caa5028c67f9';
const ASSISTANT_ID = '8cba10f2-105f-4557-8019-2d39fce9ee9b';

export const vapiService = {
  async listCalls(): Promise<ListCallsResponse> {
    const params = new URLSearchParams({
      assistantId: ASSISTANT_ID,
      limit: '1000'
    });

    const response = await fetch(`${VAPI_API_URL}/call?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch calls: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    return data;
  }
}; 