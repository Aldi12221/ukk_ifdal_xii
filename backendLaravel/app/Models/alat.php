<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\kategori;

class alat extends Model
{
    protected $guarded=[];

    function kategori (){
        return $this->belongsTo(kategori::class);
    }
}
