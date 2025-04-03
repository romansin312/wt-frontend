export class RoomService {
    private baseUrl = "http://localhost:4000"; //move to config

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