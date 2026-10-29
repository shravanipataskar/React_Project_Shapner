<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VideoController;

use App\Http\Controllers\Api\DholPathakController;
use App\Http\Controllers\Api\AuditionController;
use App\Http\Controllers\Api\TalentShowController;
use App\Http\Controllers\Api\IdeaSubmissionController;
use App\Http\Controllers\Api\CollaborationRequestController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;

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
Route::prefix('creative-ideas')->group(function () {
    Route::get('/', [IdeaSubmissionController::class, 'index']);
    Route::get('/{id}', [IdeaSubmissionController::class, 'show']);
    Route::patch('/{id}/status', [IdeaSubmissionController::class, 'updateStatus']);
});

Route::get('/collaborations', [CollaborationRequestController::class, 'index']);
Route::get('/collaborations/{id}', [CollaborationRequestController::class, 'show']);
Route::patch('/collaborations/{id}/status', [CollaborationRequestController::class, 'updateStatus']);
Route::patch('/collaborations/{id}/review-status', [CollaborationRequestController::class, 'updateReviewStatus']);
Route::get('/tickets', [TicketController::class, 'index']);
Route::get('/tickets/{id}', [TicketController::class, 'show']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);