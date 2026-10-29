<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    /**
     * Get all tickets
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('tickets')
                ->select([
                    'tickets.id',
                    'tickets.ticket_no',
                    'tickets.application_id',
                    'tickets.module_id',
                    'tickets.user_id',
                    'tickets.subject',
                    'tickets.description',
                    'tickets.category',
                    'tickets.ticket_status',
                    'tickets.attachment',
                    'tickets.status',
                    'tickets.created_at',
                    'tickets.updated_at',
                ]);

            /*
             * Active / inactive filter
             */
            if ($request->has('status') && $request->status !== '') {
                $query->where(
                    'tickets.status',
                    (int) $request->status
                );
            }

            /*
             * Module filter
             */
            if ($request->has('module_id') && $request->module_id !== '') {
                $query->where(
                    'tickets.module_id',
                    (int) $request->module_id
                );
            }

            /*
             * Overall ticket status filter
             */
            if (
                $request->has('ticket_status') &&
                $request->ticket_status !== ''
            ) {
                $query->where(
                    'tickets.ticket_status',
                    $request->ticket_status
                );
            }

            /*
             * Search
             */
            if ($request->has('search') && trim($request->search) !== '') {
                $search = trim($request->search);

                $query->where(function ($q) use ($search) {
                    $q->where(
                        'tickets.ticket_no',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'tickets.subject',
                        'like',
                        '%' . $search . '%'
                    )
                    ->orWhere(
                        'tickets.category',
                        'like',
                        '%' . $search . '%'
                    );
                });
            }

            $tickets = $query
                ->orderByDesc('tickets.id')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Tickets fetched successfully.',
                'data' => $tickets,
            ], 200);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch tickets.',
                'error' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get one ticket
     */
    public function show($id)
    {
        try {
            $ticket = DB::table('tickets')
                ->where('id', $id)
                ->first();

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found.',
                    'data' => null,
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket fetched successfully.',
                'data' => $ticket,
            ], 200);

        } catch (\Throwable $e) {

            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch ticket.',
                'error' => $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}
