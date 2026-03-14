<?php
// database/migrations/2024_01_01_000005_create_rfqs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rfqs', function (Blueprint $table) {
            $table->id();
            $table->string('rfq_number')->unique();
            $table->foreignId('buyer_id')->constrained('users');
            $table->string('title');
            $table->text('description');
            $table->json('products_requested');
            $table->integer('quantity');
            $table->date('required_by_date');
            $table->enum('status', ['open', 'quoted', 'closed'])->default('open');
            $table->timestamps();
        });

    }

    public function down()
    {
        Schema::dropIfExists('rfqs');
    }
};
