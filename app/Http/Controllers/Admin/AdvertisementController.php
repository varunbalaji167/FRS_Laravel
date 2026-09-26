<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Department;
use Illuminate\Http\Request;
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
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference_number' => 'required|string|unique:advertisements,reference_number',
            'title' => 'required|string|max:255',
            'deadline' => 'required|date',
            'document' => 'required|file|mimes:pdf|max:5120',
            'departments' => 'required|array|min:1',
        ]);

        $filePath = $request->file('document')->store('advertisements', 'public');

        Advertisement::create([
            'reference_number' => $validated['reference_number'],
            'title' => $validated['title'],
            'deadline' => $validated['deadline'],
            'departments' => $validated['departments'],
            'document_path' => $filePath,
        ]);

        return redirect()->route('admin.jobs.create')
            ->with('success', 'Advertisement published successfully!');
    }
}
