<?php
// database/migrations/2024_01_01_000002_create_suppliers_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('trade_license_number');
            $table->string('company_phone');
            $table->string('company_email');
            $table->text('company_address');
            $table->string('city');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->timestamps();
        });

        // Insert test supplier data
        DB::table('suppliers')->insert([
            [
                'user_id' => 2, // Supplier User
                'company_name' => 'PT Supplier Makmur',
                'trade_license_number' => 'SIUP-12345-2024',
                'company_phone' => '021-5551234',
                'company_email' => 'contact@suppliermakmur.com',
                'company_address' => 'Jl. Industri Raya No. 45, Jakarta Barat',
                'city' => 'Jakarta',
                'verification_status' => 'verified',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('suppliers');
    }
};
