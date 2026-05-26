def greeting_tool(name: str) -> str:
    return f"Hello, {name}!"


def calculate_pi_5_digits() -> float:
    """
    Calculate pi to the 5th decimal digit using the Machin formula.
    Returns pi ≈ 3.14159
    """
    from decimal import Decimal, getcontext
    
    # Set precision high enough to calculate accurately
    getcontext().prec = 50
    
    # Machin's formula: pi/4 = 4*arctan(1/5) - arctan(1/239)
    def arctan(x, num_terms):
        power = x
        result = power
        for n in range(1, num_terms):
            power *= -x * x
            result += power / (2 * n + 1)
        return result
    
    one = Decimal(1)
    five = Decimal(5)
    two_three_nine = Decimal(239)
    
    # Calculate pi using Machin formula
    pi = 4 * (4 * arctan(one / five, 50) - arctan(one / two_three_nine, 50))
    
    # Return as float rounded to 5 decimal places
    return float(pi)