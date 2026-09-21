<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('climas', function (Blueprint $table) {
            $table->id();
            $table->string('ciudad');
            $table->decimal('temperatura', 5, 2);
            $table->unsignedTinyInteger('humedad');
            $table->string('condicion_clima');
            $table->timestamp('fecha_consulta');
            $table->timestamps();

            $table->index('ciudad');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('climas');
    }
};
