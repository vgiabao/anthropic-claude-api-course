"""
Test file for main.py functions
"""
import math
from main import greeting_tool, calculate_pi_5_digits


def test_greeting_tool():
    """Test the greeting_tool function"""
    print("Testing greeting_tool...")
    assert greeting_tool("Alice") == "Hello, Alice!"
    assert greeting_tool("Bob") == "Hello, Bob!"
    assert greeting_tool("World") == "Hello, World!"
    print("✓ greeting_tool tests passed!")


def test_calculate_pi_5_digits():
    """Test the calculate_pi_5_digits function"""
    print("\nTesting calculate_pi_5_digits...")
    
    pi_calculated = calculate_pi_5_digits()
    pi_expected = 3.14159  # pi to 5th decimal digit
    
    print(f"Calculated pi: {pi_calculated}")
    print(f"Expected pi:   {pi_expected}")
    print(f"Math.pi:       {math.pi}")
    
    # Check if the calculated value is close to the expected value
    # Allow some small tolerance for floating point precision
    assert abs(pi_calculated - pi_expected) < 0.000001, \
        f"Expected pi ≈ {pi_expected}, but got {pi_calculated}"
    
    # Also verify it's reasonably close to the actual value of pi
    assert abs(pi_calculated - math.pi) < 0.00001, \
        f"Calculated value {pi_calculated} is too far from actual pi {math.pi}"
    
    print("✓ calculate_pi_5_digits tests passed!")


def test_pi_accuracy():
    """Additional test to verify pi calculation accuracy"""
    print("\nTesting pi calculation accuracy...")
    
    pi_calculated = calculate_pi_5_digits()
    
    # Check decimal places
    pi_str = f"{pi_calculated:.5f}"
    print(f"Pi to 5 decimal places: {pi_str}")
    
    # Verify the first 5 digits after decimal
    assert pi_str.startswith("3.14159"), \
        f"Expected 3.14159, but got {pi_str}"
    
    print("✓ Pi accuracy test passed!")


if __name__ == "__main__":
    try:
        test_greeting_tool()
        test_calculate_pi_5_digits()
        test_pi_accuracy()
        print("\n" + "="*50)
        print("All tests passed! ✓")
        print("="*50)
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        exit(1)
