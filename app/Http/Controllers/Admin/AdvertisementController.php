<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Ads\StoreAdvertisementRequest;
use App\Models\Advertisement;
use App\Models\Department;
use Inertia\Inertia;

class AdvertisementController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Jobs/Index', [
            'advertisements' => Advertisement::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Jobs/Create', [
            'departments' => Department::allCached(),
        ]);
    }

    public function store(StoreAdvertisementRequest $request)
    {
        $validated = $request->validated();

        $filePath = $request->file('document')->store('advertisements', 'public');

        $advertisement = Advertisement::create([
            'reference_number' => $validated['reference_number'],
            'title' => $validated['title'],
            'deadline' => $validated['deadline'],
            'departments' => $validated['departments'],
            'document_path' => $filePath,
        ]);

        // Keep the Phase 8 FK pivot in sync with the legacy JSON department
        // map (`{ "Dept Name": ["Grade 1", ...] }` — see
        // StoreAdvertisementRequest).
        $ids = collect(array_keys($validated['departments']))
            ->map(fn ($name) => Department::idForName($name))
            ->filter()
            ->all();
        $advertisement->departmentModels()->sync($ids);

        return redirect()->route('admin.jobs.create')
            ->with('success', 'Advertisement published successfully!');
    }
}
