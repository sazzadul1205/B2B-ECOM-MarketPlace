<?php
// database/migrations/2024_01_01_000008_create_orders_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('supplier_id')->constrained('users');
            $table->foreignId('rfq_id')->nullable()->constrained()->onDelete('set null');
            $table->decimal('total_amount', 15, 2);
            $table->string('shipping_address');
            $table->enum('payment_status', ['pending', 'paid'])->default('pending');
            $table->enum('order_status', [
                'pending_confirmation',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            ])->default('pending_confirmation');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};
