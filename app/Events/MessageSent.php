<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->message->receiver_id),
            new PrivateChannel('App.Models.User.' . $this->message->sender_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'message' => $this->message->message,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'rfq_id' => $this->message->rfq_id,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at,
            'sender' => $this->message->sender ? [
                'id' => $this->message->sender->id,
                'name' => $this->message->sender->name,
            ] : null,
            'receiver' => $this->message->receiver ? [
                'id' => $this->message->receiver->id,
                'name' => $this->message->receiver->name,
            ] : null,
            'rfq' => $this->message->rfq ? [
                'id' => $this->message->rfq->id,
                'title' => $this->message->rfq->title,
            ] : null,
        ];
    }
}
