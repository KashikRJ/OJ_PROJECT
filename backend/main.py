def find_missing_number(n, arr):
    total_sum = n * (n + 1) // 2
    array_sum = sum(arr)
    return total_sum - array_sum

if __name__ == "__main__":
    n = int(input().strip())
    arr = list(map(int, input().strip().split()))
    print(find_missing_number(n, arr))