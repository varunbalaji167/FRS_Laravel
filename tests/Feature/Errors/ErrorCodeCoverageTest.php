<?php

namespace Tests\Feature\Errors;

use App\Support\ErrorCode;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use Tests\TestCase;

/**
 * A new ErrorCode is not done until it has a test that triggers it and a row
 * in docs/errors.md.
 */
class ErrorCodeCoverageTest extends TestCase
{
    public function test_every_error_code_is_triggered_by_at_least_one_test(): void
    {
        $corpus = $this->suiteSource();

        foreach (ErrorCode::cases() as $case) {
            $this->assertStringContainsString(
                $case->value,
                $corpus,
                "ErrorCode::{$case->name} has no test that triggers it. Add one before adding the code.",
            );
        }
    }

    public function test_every_error_code_is_documented(): void
    {
        $docs = file_get_contents(base_path('docs/errors.md'));

        foreach (ErrorCode::cases() as $case) {
            $this->assertStringContainsString(
                $case->value,
                $docs,
                "ErrorCode::{$case->name} is missing from docs/errors.md.",
            );
        }
    }

    private function suiteSource(): string
    {
        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(base_path('tests')));
        $source = '';

        foreach ($files as $file) {
            if ($file->isFile() && $file->getExtension() === 'php' && $file->getFilename() !== basename(__FILE__)) {
                $source .= file_get_contents($file->getPathname());
            }
        }

        return $source;
    }
}
