<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    private const CATEGORIES = ['bug', 'development', 'both'];

    private const ITEM_TYPES = ['bug', 'development', 'enhancement'];

    private const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

    private const SEVERITIES = ['low', 'medium', 'high', 'critical'];

    /**
     * Return active records and supported ticket choices for the create form.
     */
    public function createOptions(Request $request)
    {
        $validated = $request->validate([
            'application_id' => ['nullable', 'integer', 'exists:applications,id'],
        ]);

        $modules = DB::table('modules')
            ->where('status', 1)
            ->when(
                isset($validated['application_id']),
                fn ($query) => $query->where(
                    'application_id',
                    $validated['application_id']
                )
            )
            ->select(['id', 'application_id', 'module_name'])
            ->orderBy('module_name')
            ->get();

        return response()->json([
            'data' => [
                'applications' => DB::table('applications')
                    ->where('status', 1)
                    ->select(['id', 'app_name'])
                    ->orderBy('app_name')
                    ->get(),
                'modules' => $modules,
                'categories' => self::CATEGORIES,
                'item_types' => self::ITEM_TYPES,
                'priorities' => self::PRIORITIES,
                'severities' => self::SEVERITIES,
            ],
        ]);
    }

    /**
     * Create a ticket and its items, preserving the existing foreign keys.
     */
    public function store(Request $request)
    {
        if (! $request->filled('user_id')) {
            $request->merge([
                'user_id' => DB::table('users')
                    ->where('status', 1)
                    ->orderBy('name')
                    ->orderBy('id')
                    ->value('id'),
            ]);
        }

        $validated = $request->validate([
            'application_id' => [
                'required',
                'integer',
                Rule::exists('applications', 'id')->where('status', 1),
            ],
            'module_id' => [
                'required',
                'integer',
                Rule::exists('modules', 'id')
                    ->where('status', 1)
                    ->where('application_id', $request->input('application_id')),
            ],
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where('status', 1),
            ],
            'subject' => ['required', 'string', 'max:255'],
            'category' => [
                'required',
                'string',
                'max:50',
                Rule::in(self::CATEGORIES),
            ],
            'description' => ['required', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx', 'max:5120'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.item_type' => [
                'required',
                'string',
                'max:30',
                Rule::in(self::ITEM_TYPES),
            ],
            'items.*.priority' => [
                'required',
                'string',
                'max:20',
                Rule::in(self::PRIORITIES),
            ],
            'items.*.severity' => [
                'required',
                'string',
                'max:20',
                Rule::in(self::SEVERITIES),
            ],
            'items.*.attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx',
                'max:5120',
            ],
            'items.*.description' => ['nullable', 'string'],
        ]);

        $storedFiles = [];

        try {
            $ticket = DB::transaction(function () use ($request, $validated, &$storedFiles) {
                $now = now();
                $ticketNo = $this->makeTicketNumber();
                $attachment = $request->file('attachment');
                $attachmentPath = $attachment
                    ? $attachment->store('uploads/tickets', 'public')
                    : null;

                if ($attachmentPath) {
                    $storedFiles[] = $attachmentPath;
                }

                $ticketId = DB::table('tickets')->insertGetId([
                    'ticket_no' => $ticketNo,
                    'application_id' => $validated['application_id'],
                    'module_id' => $validated['module_id'],
                    'user_id' => $validated['user_id'],
                    'subject' => $validated['subject'],
                    'description' => $validated['description'],
                    'category' => $validated['category'],
                    'ticket_status' => 'Open',
                    'attachment' => $attachmentPath,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                foreach ($validated['items'] as $index => $item) {
                    $itemAttachment = $request->file("items.$index.attachment");
                    $itemAttachmentPath = $itemAttachment
                        ? $itemAttachment->store('uploads/tickets/items', 'public')
                        : null;

                    if ($itemAttachmentPath) {
                        $storedFiles[] = $itemAttachmentPath;
                    }

                    DB::table('ticket_items')->insert([
                        'ticket_id' => $ticketId,
                        'title' => $item['title'],
                        'description' => $item['description'] ?? null,
                        'item_type' => $item['item_type'],
                        'priority' => $item['priority'],
                        'severity' => $item['severity'],
                        'ticket_status' => 'Open',
                        'attachment' => $itemAttachmentPath,
                        'status' => 1,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }

                return DB::table('tickets')->where('id', $ticketId)->first();
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($storedFiles);
            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully.',
            'data' => $ticket,
        ], 201);
    }

    private function makeTicketNumber(): string
    {
        do {
            $ticketNo = 'TK-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (DB::table('tickets')->where('ticket_no', $ticketNo)->exists());

        return $ticketNo;
    }

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
                        '%'.$search.'%'
                    )
                        ->orWhere(
                            'tickets.subject',
                            'like',
                            '%'.$search.'%'
                        )
                        ->orWhere(
                            'tickets.category',
                            'like',
                            '%'.$search.'%'
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
     * Update a ticket and synchronize its active items.
     */
    public function update(Request $request, $id)
    {
        $ticket = DB::table('tickets')->where('id', $id)->first();
        if (! $ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found.',
            ], 404);
        }

        $validated = $request->validate([
            'application_id' => [
                'required',
                'integer',
                Rule::exists('applications', 'id')->where('status', 1),
            ],
            'module_id' => [
                'required',
                'integer',
                Rule::exists('modules', 'id')
                    ->where('status', 1)
                    ->where('application_id', $request->input('application_id')),
            ],
            'subject' => ['required', 'string', 'max:255'],
            'category' => [
                'required',
                'string',
                'max:50',
                Rule::in(self::CATEGORIES),
            ],
            'description' => ['required', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx', 'max:5120'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.item_type' => [
                'required',
                'string',
                'max:30',
                Rule::in(self::ITEM_TYPES),
            ],
            'items.*.priority' => [
                'required',
                'string',
                'max:20',
                Rule::in(self::PRIORITIES),
            ],
            'items.*.severity' => [
                'required',
                'string',
                'max:20',
                Rule::in(self::SEVERITIES),
            ],
            'items.*.attachment' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx',
                'max:5120',
            ],
            'items.*.description' => ['nullable', 'string'],
        ]);

        $existingItems = DB::table('ticket_items')
            ->where('ticket_id', $id)
            ->where('status', 1)
            ->get()
            ->keyBy('id');
        foreach ($validated['items'] as $item) {
            if (
                isset($item['id']) &&
                ! $existingItems->has((int) $item['id'])
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'One or more ticket items do not belong to this ticket.',
                ], 422);
            }
        }

        $storedFiles = [];
        try {
            DB::transaction(function () use (
                $request,
                $validated,
                $id,
                $ticket,
                $existingItems,
                &$storedFiles
            ) {
                $now = now();
                $attachment = $request->file('attachment');
                $attachmentPath = $attachment
                    ? $attachment->store('uploads/tickets', 'public')
                    : $ticket->attachment;
                if ($attachment && $attachmentPath) {
                    $storedFiles[] = $attachmentPath;
                }

                DB::table('tickets')->where('id', $id)->update([
                    'application_id' => $validated['application_id'],
                    'module_id' => $validated['module_id'],
                    'subject' => $validated['subject'],
                    'description' => $validated['description'],
                    'category' => $validated['category'],
                    'attachment' => $attachmentPath,
                    'updated_at' => $now,
                ]);

                $submittedItemIds = [];
                foreach ($validated['items'] as $index => $item) {
                    $existingItem = isset($item['id'])
                        ? $existingItems->get((int) $item['id'])
                        : null;
                    $itemAttachment = $request->file("items.$index.attachment");
                    $itemAttachmentPath = $itemAttachment
                        ? $itemAttachment->store('uploads/tickets/items', 'public')
                        : ($existingItem->attachment ?? null);
                    if ($itemAttachment && $itemAttachmentPath) {
                        $storedFiles[] = $itemAttachmentPath;
                    }

                    $fields = [
                        'title' => $item['title'],
                        'description' => $item['description'] ?? null,
                        'item_type' => $item['item_type'],
                        'priority' => $item['priority'],
                        'severity' => $item['severity'],
                        'attachment' => $itemAttachmentPath,
                        'updated_at' => $now,
                    ];

                    if ($existingItem) {
                        DB::table('ticket_items')
                            ->where('id', $existingItem->id)
                            ->update($fields);
                        $submittedItemIds[] = $existingItem->id;
                    } else {
                        $submittedItemIds[] = DB::table('ticket_items')
                            ->insertGetId([
                                ...$fields,
                                'ticket_id' => $id,
                                'ticket_status' => 'Open',
                                'status' => 1,
                                'created_at' => $now,
                            ]);
                    }
                }

                DB::table('ticket_items')
                    ->where('ticket_id', $id)
                    ->where('status', 1)
                    ->whereNotIn('id', $submittedItemIds)
                    ->update(['status' => 0, 'updated_at' => $now]);
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($storedFiles);
            throw $exception;
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully.',
            'data' => DB::table('tickets')->where('id', $id)->first(),
        ]);
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

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found.',
                    'data' => null,
                ], 404);
            }

            $ticket->items = DB::table('ticket_items')
                ->where('ticket_id', $id)
                ->where('status', 1)
                ->orderBy('id')
                ->get();

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

    /**
     * Activate / deactivate ticket.
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $ticket = DB::table('tickets')
                ->where('id', $id)
                ->first();

            if (! $ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found.',
                ], 404);
            }

            $request->validate([
                'status' => ['required'],
            ]);

            $rawStatus = $request->input('status');
            $status = (filter_var($rawStatus, FILTER_VALIDATE_BOOLEAN) || (int) $rawStatus === 1) ? 1 : 0;

            DB::table('tickets')
                ->where('id', $id)
                ->update([
                    'status' => $status,
                    'updated_at' => now(),
                ]);

            $actionText = $status === 1 ? 'activated' : 'deactivated';

            return response()->json([
                'success' => true,
                'message' => "Ticket {$actionText} successfully.",
                'data' => [
                    'id' => (int) $id,
                    'status' => $status,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to update ticket status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

