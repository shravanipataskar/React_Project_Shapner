<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VideoController;

use App\Http\Controllers\Api\DholPathakController;
use App\Http\Controllers\Api\AuditionController;
use App\Http\Controllers\Api\TalentShowController;

Route::apiResource('videos', VideoController::class);
Route::get('/auditions', [AuditionController::class, 'index']);

Route::get('/auditions/{id}', [AuditionController::class, 'show']);
Route::patch('/auditions/{id}/status', [AuditionController::class, 'updateStatus']);
Route::get('/dhol-pathaks', [DholPathakController::class, 'index']);
Route::get('/dhol-pathaks/{id}', [DholPathakController::class, 'show']);
Route::post('/dhol-pathaks', [DholPathakController::class, 'store']);
Route::put('/dhol-pathaks/{id}', [DholPathakController::class, 'update']);
Route::patch('/dhol-pathaks/{id}', [DholPathakController::class, 'update']);
Route::delete('/dhol-pathaks/{id}', [DholPathakController::class, 'destroy']);
Route::get('/talent-shows', [TalentShowController::class, 'index']);
Route::get('/talent-shows/{id}', [TalentShowController::class, 'show']);
Route::put('/talent-shows/{id}', [TalentShowController::class, 'update']);
Route::patch('/talent-shows/{id}', [TalentShowController::class, 'update']);