import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { Add as AddIcon } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";
import { useToast } from "../../context/ToastContext";
import { useCategories } from "../../context/CategoryContext";
import { useParams, useNavigate } from "react-router-dom";

export function SubcategoryClone() {
  const { showToast } = useToast();
  const { categories } = useCategories();
  const { parentSlug, slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Table structures state
  const [tableStructures, setTableStructures] = useState([]);

  // Fetch table structures on mount
  useEffect(() => {
    async function fetchTableStructures() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/structure/get-table`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) setTableStructures(data.rowData || []);
      } catch (error) {
        showToast("Failed to load table structures", error);
      }
    }
    fetchTableStructures();
  }, [showToast]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      type: "",
      parentSlug: "",
      tableStructureSlug: "",
    },
  });

  // Fetch subcategory details
  useEffect(() => {
    setLoading(true);
    fetch(
      `${API_BASE_URL}/api/category/${parentSlug}/get-sub-category/${slug}`,
      {
        credentials: "include",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.subcategory) {
          reset({
            name: data.subcategory.name,
            slug: data.subcategory.slug,
            description: data.subcategory.description,
            type: data.subcategory.type,
            parentSlug: data.subcategory.parentSlug,
            tableStructureSlug: data.subcategory.tableStructureSlug || "",
          });
        } else {
          showToast("Subcategory not found", "error");
          navigate("/category");
        }
        setLoading(false);
      })
      .catch(() => {
        showToast("Failed to fetch subcategory", "error");
        setLoading(false);
        navigate("/category");
      });
    // eslint-disable-next-line
  }, [slug]);

  const selectedType = watch("type");

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/category/create-sub-category`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (result.success) {
        showToast("Subcategory updated successfully!", "success");
        navigate("/category");
      } else {
        showToast(result.message || "Failed to update subcategory.", "error");
      }
    } catch (error) {
      showToast("Error updating subcategory.", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "103%",
        background: "linear-gradient(135deg, #f4f0e4 0%, #ffe0e0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          minWidth: 400,
          maxWidth: 480,
          boxShadow: "0 8px 32px rgba(128,0,0,0.15)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#800000",
            mb: 2,
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          <AddIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Edit Subcategory
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <Stack spacing={2}>
            <TextField
              label="Subcategory Name"
              {...register("name", { required: "Name is required" })}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <TextField
              label="Slug"
              {...register("slug", { required: "Slug is required" })}
              error={!!errors.slug}
              helperText={errors.slug?.message}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">/</InputAdornment>
                ),
              }}
            />
            <TextField
              label="Description"
              {...register("description")}
              multiline
              minRows={2}
              fullWidth
              variant="outlined"
              sx={{ background: "#fff" }}
            />
            <Controller
              name="type"
              control={control}
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  displayEmpty
                  fullWidth
                  variant="outlined"
                  sx={{ background: "#fff" }}
                  error={!!errors.type}
                >
                  <MenuItem value="">
                    <em>Select Type</em>
                  </MenuItem>
                  <MenuItem value="post">Post</MenuItem>
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                </Select>
              )}
            />
            <Controller
              name="parentSlug"
              control={control}
              rules={{ required: "Parent Category is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  variant="outlined"
                  sx={{ background: "#fff" }}
                  error={!!errors.parentSlug}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Parent Category</em>
                  </MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <input
              type="hidden"
              {...register("parentSlug")}
              value={watch("parentSlug")}
            />
            <Controller
              name="tableStructureSlug"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  fullWidth
                  variant="outlined"
                  sx={{ background: "#fff" }}
                  disabled={selectedType !== "table"}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Select Table Structure</em>
                  </MenuItem>
                  {tableStructures.map((structure) => (
                    <MenuItem key={structure.slug} value={structure.slug}>
                      {structure.name} ({structure.slug})
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                background: "#800000",
                color: "#fffaf5",
                fontWeight: 600,
                letterSpacing: 1,
                py: 1.2,
                borderRadius: 2,
                fontSize: "1rem",
                "&:hover": { background: "#4d0000" },
              }}
              disabled={isSubmitting}
              startIcon={<AddIcon />}
            >
              {isSubmitting ? "Adding..." : "Add Subcategory"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
