<?php
// database/migrations/2024_01_01_000006_create_rfq_quotes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rfq_quotes', function (Blueprint $table) {
            $table->id();
            $table->string('quote_number')->unique();
            $table->foreignId('rfq_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained('users');
            $table->decimal('total_amount', 15, 2);
            $table->json('product_breakdown');
            $table->date('valid_until');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['rfq_id', 'supplier_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('rfq_quotes');
    }
};
