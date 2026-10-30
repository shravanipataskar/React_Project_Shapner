<?php

use App\Http\Controllers\Api\AuditionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollaborationRequestController;
use App\Http\Controllers\Api\DholPathakController;
use App\Http\Controllers\Api\IdeaSubmissionController;
use App\Http\Controllers\Api\TalentShowController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

Route::get('/auth/me', [AuthController::class, 'me'])
    ->middleware('auth:sanctum');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
Route::post('/auth/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/videos', [VideoController::class, 'index']);

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/videos', [VideoController::class, 'adminIndex']);
    Route::apiResource('admin/videos', VideoController::class)->except(['index']);
    Route::post('/admin/auditions', [AuditionController::class, 'store']);
    Route::get('/auditions', [AuditionController::class, 'index']);
    Route::get('/auditions/{id}', [AuditionController::class, 'show']);
    Route::put('/auditions/{id}', [AuditionController::class, 'update']);
    Route::patch('/auditions/{id}', [AuditionController::class, 'update']);
    Route::patch('/auditions/{id}/status', [AuditionController::class, 'updateStatus']);

    Route::get('/dhol-pathaks', [DholPathakController::class, 'index']);
    Route::post('/admin/dhol-pathaks', [DholPathakController::class, 'store']);
    Route::get('/dhol-pathaks/{id}', [DholPathakController::class, 'show']);
    Route::put('/dhol-pathaks/{id}', [DholPathakController::class, 'update']);
    Route::patch('/dhol-pathaks/{id}', [DholPathakController::class, 'update']);
    Route::delete('/dhol-pathaks/{id}', [DholPathakController::class, 'destroy']);

    Route::get('/talent-shows', [TalentShowController::class, 'index']);
    Route::get('/talent-shows/{id}', [TalentShowController::class, 'show']);
    Route::post('/talent-shows', [TalentShowController::class, 'store']);
    Route::put('/talent-shows/{id}', [TalentShowController::class, 'update']);
    Route::patch('/talent-shows/{id}', [TalentShowController::class, 'update']);

    Route::prefix('creative-ideas')->group(function () {
        Route::get('/', [IdeaSubmissionController::class, 'index']);
        Route::get('/{id}', [IdeaSubmissionController::class, 'show']);
        Route::put('/{id}', [IdeaSubmissionController::class, 'update']);
        Route::patch('/{id}', [IdeaSubmissionController::class, 'update']);
        Route::patch('/{id}/status', [IdeaSubmissionController::class, 'updateStatus']);
    });
    Route::post('/admin/creative-ideas', [IdeaSubmissionController::class, 'store']);

    Route::get('/collaborations', [CollaborationRequestController::class, 'index']);
    Route::post('/admin/collaborations', [CollaborationRequestController::class, 'store']);
    Route::get('/collaborations/{id}', [CollaborationRequestController::class, 'show']);
    Route::put('/collaborations/{id}', [CollaborationRequestController::class, 'update']);
    Route::patch('/collaborations/{id}', [CollaborationRequestController::class, 'update']);
    Route::patch('/collaborations/{id}/status', [CollaborationRequestController::class, 'updateStatus']);
    Route::patch('/collaborations/{id}/review-status', [CollaborationRequestController::class, 'updateReviewStatus']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/ticket-options', [TicketController::class, 'createOptions']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::patch('/tickets/{id}/status', [TicketController::class, 'updateStatus']);

});

Route::middleware(['auth:sanctum', 'super-admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/options', [UserController::class, 'createOptions']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::patch('/users/{id}/status', [UserController::class, 'updateStatus']);
});

Route::post('/auditions', [AuditionController::class, 'store']);
Route::post('/dhol-pathaks', [DholPathakController::class, 'store']);

Route::post('/collaborations', [CollaborationRequestController::class, 'store']);
Route::post('/creative-ideas', [IdeaSubmissionController::class, 'store']);
