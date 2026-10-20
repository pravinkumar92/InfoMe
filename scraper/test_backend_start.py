"""Test if backend can start without gRPC"""
import sys

print("Testing backend imports...")
print("=" * 60)

# Test 1: Import AI modules
print("\n1. Testing AI module imports...")
try:
    from ai.classifier import AIProcessor, GENAI_AVAILABLE
    print(f"   ✅ AIProcessor imported successfully")
    print(f"   📊 GENAI_AVAILABLE: {GENAI_AVAILABLE}")
except Exception as e:
    print(f"   ❌ Failed to import AIProcessor: {e}")
    sys.exit(1)

try:
    from ai.gemini_analyzer import GeminiAnalyzer, GENAI_AVAILABLE as GEMINI_AVAILABLE
    print(f"   ✅ GeminiAnalyzer imported successfully")
    print(f"   📊 GEMINI_AVAILABLE: {GEMINI_AVAILABLE}")
except Exception as e:
    print(f"   ❌ Failed to import GeminiAnalyzer: {e}")
    sys.exit(1)

# Test 2: Try to create AI instances
print("\n2. Testing AI instance creation...")
if GENAI_AVAILABLE:
    try:
        ai = AIProcessor(use_gemini=False)
        print("   ✅ AIProcessor instance created (OpenAI mode)")
    except Exception as e:
        print(f"   ⚠️  AIProcessor creation failed: {e}")
    
    try:
        gemini = GeminiAnalyzer()
        print("   ✅ GeminiAnalyzer instance created")
    except Exception as e:
        print(f"   ⚠️  GeminiAnalyzer creation failed: {e}")
else:
    print("   ⚠️  Gemini not available - this is expected if gRPC is blocked")
    print("   ℹ️  Backend will run without AI features")

# Test 3: Import API server
print("\n3. Testing API server import...")
try:
    from api_server import app, AI_AVAILABLE
    print(f"   ✅ API server imported successfully")
    print(f"   📊 AI_AVAILABLE: {AI_AVAILABLE}")
except Exception as e:
    print(f"   ❌ Failed to import API server: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED!")
print("=" * 60)
print("\n🚀 Backend should start successfully now!")
print("   Run: python api_server.py")
print("\n⚠️  Note: AI features will be disabled if gRPC is blocked")
print("   Text extraction will still work for PDFs")
