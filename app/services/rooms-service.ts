import { BASE_URL } from "config";

export class RoomService {
    private baseUrl = `http://${BASE_URL}`;

    async getRoom(id: string): Promise<RoomModel> {
        return (await fetch(`${this.baseUrl}/room/${id}/get`)).json();
    }

    async createRoom(videoUrl: string): Promise<any> {
        const body = {
            videoUrl
        }

        return (await fetch(`${this.baseUrl}/rooms/create`, {
            body: JSON.stringify(body),
            method: 'POST'
        })).text();
    }

}