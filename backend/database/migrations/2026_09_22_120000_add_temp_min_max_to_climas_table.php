<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Minima y maxima de la medicion, que OpenWeatherMap ya devolvia y no se
     * estaba guardando. Son nullable a proposito: las consultas anteriores a
     * esta migracion no las tienen y la interfaz oculta la linea si faltan.
     */
    public function up(): void
    {
        Schema::table('climas', function (Blueprint $table) {
            $table->decimal('temp_min', 5, 2)->nullable()->after('temperatura');
            $table->decimal('temp_max', 5, 2)->nullable()->after('temp_min');
        });
    }

    public function down(): void
    {
        Schema::table('climas', function (Blueprint $table) {
            $table->dropColumn(['temp_min', 'temp_max']);
        });
    }
};
