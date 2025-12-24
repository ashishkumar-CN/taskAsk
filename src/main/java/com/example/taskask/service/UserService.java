package com.example.taskask.service;

import com.example.taskask.dto.CreateUserRequest;
import com.example.taskask.dto.EmployeeResponse;
import com.example.taskask.dto.UserSummary;
import com.example.taskask.entity.User;
import com.example.taskask.enums.Role;
import com.example.taskask.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest request) {
        userRepository.findByEmail(request.email())
                .ifPresent(u -> { throw new ResponseStatusException(BAD_REQUEST, "Email already exists"); });

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password())) // hash here
                .role(request.role())
                .isActive(true)
                .build();

        return userRepository.save(user);
    }

    public User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "User not found: " + userId));
    }

    public User getByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "User not found: " + email));
    }

    public List<EmployeeResponse> getEmployees() {
        // return assignable users (employees + team leads)
        return userRepository.findByRoleIn(List.of(Role.EMPLOYEE, Role.TEAM_LEAD)).stream()
                .map(user -> new EmployeeResponse(user.getId(), user.getFullName(), user.getEmail()))
                .toList();
    }

    public List<UserSummary> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserSummary(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole(),
                        Boolean.TRUE.equals(user.getIsActive())
                ))
                .toList();
    }
}
